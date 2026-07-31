const { BigQuery } = require("@google-cloud/bigquery");
const { GCP_COMMON_PROJECT_ID, REGION } = require("../../config/config");

/**
 * Infers BigQuery schema from a sample data object
 * @param {Object} sampleData - Sample object from the table array
 * @returns {Array} BigQuery schema fields
 */
function inferSchema(sampleData) {
  const schema = [];
  
  for (const [key, value] of Object.entries(sampleData)) {
    let type = "STRING"; // Default to STRING
    let mode = "NULLABLE";
    
    if (Array.isArray(value)) {
      // Handle arrays - infer type from first element
      mode = "REPEATED";
      if (value.length > 0) {
        const firstElement = value[0];
        if (typeof firstElement === "number") {
          type = Number.isInteger(firstElement) ? "INTEGER" : "FLOAT";
        } else if (typeof firstElement === "boolean") {
          type = "BOOLEAN";
        } else if (firstElement instanceof Date) {
          type = "TIMESTAMP";
        } else if (typeof firstElement === "object" && firstElement !== null) {
          type = "JSON";
        } else {
          type = "STRING";
        }
      }
    } else if (typeof value === "number") {
      type = Number.isInteger(value) ? "INTEGER" : "FLOAT";
    } else if (typeof value === "boolean") {
      type = "BOOLEAN";
    } else if (value instanceof Date) {
      type = "TIMESTAMP";
    } else if (typeof value === "object" && value !== null) {
      type = "JSON";
    }
    
    schema.push({
      name: key,
      type: type,
      mode: mode,
    });
  }
  
  return schema;
}

/**
 * Ensures dataset exists, creates it if it doesn't
 * @param {BigQuery} bigquery - BigQuery client instance
 * @param {string} datasetId - Dataset ID
 */
async function ensureDatasetExists(bigquery, datasetId) {
  const dataset = bigquery.dataset(datasetId);
  const [exists] = await dataset.exists();
  
  if (!exists) {
    await bigquery.createDataset(datasetId, { location: REGION });
  }
}

/**
 * Creates or replaces a BigQuery table
 * @param {Object} value - Configuration object
 * @param {string} value.dataset - Dataset ID
 * @param {string} value.table_name - Table ID
 * @param {Array} value.table - Array of data rows (used for schema inference)
 * @param {Array} [value.cluster] - Optional clustering fields
 * @returns {Object} Status response
 */
async function createBqTable(value) {
  try {
    // Validate required fields
    if (!value?.dataset) throw new Error("value.dataset is required");
    if (!value?.table_name) throw new Error("value.table_name is required");
    if (!Array.isArray(value.table) || value.table.length === 0) {
      throw new Error("value.table must be a non-empty array");
    }

    const { dataset: datasetId, table_name: tableId, cluster } = value;
    
    console.log(
      `Creating/replacing table: ${GCP_COMMON_PROJECT_ID}.${datasetId}.${tableId}`
    );

    // Initialize BigQuery client
    const bigquery = new BigQuery({ projectId: GCP_COMMON_PROJECT_ID });

    // Ensure dataset exists
    await ensureDatasetExists(bigquery, datasetId);

    // Infer schema from first row
    const schema = inferSchema(value.table[0]);

    // Prepare table options
    const tableOptions = {
      schema: schema,
      location: REGION,
    };

    // Add clustering if specified
    if (cluster && Array.isArray(cluster) && cluster.length > 0) {
      tableOptions.clustering = { fields: cluster };
    }

    // Delete table if it exists, then create new one
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    const [tableExists] = await table.exists();

    if (tableExists) {
      await table.delete();
    }

    // Create the table
    await dataset.createTable(tableId, tableOptions);

    return {
      status: 200,
      message: "Table created/replaced successfully",
      table: `${GCP_COMMON_PROJECT_ID}.${datasetId}.${tableId}`,
    };

  } catch (error) {
    console.error("Error creating BigQuery table:", error);
    return {
      status: 500,
      message: "Error creating BigQuery table",
      error: error.message,
    };
  }
}

/**
 * Inserts data into a BigQuery table
 * @param {string} datasetId - Dataset ID
 * @param {string} tableId - Table ID
 * @param {Array} rows - Array of rows to insert
 * @returns {Object} Status response
 */
async function insertDataToBqTable(datasetId, tableId, rows) {
  try {
    const bigquery = new BigQuery({ projectId: GCP_COMMON_PROJECT_ID });
    const table = bigquery.dataset(datasetId).table(tableId);

    console.log(`Inserting ${rows.length} rows into ${datasetId}.${tableId}`);

    const [insertResult] = await table.insert(rows);

    // Check for insert errors
    if (insertResult?.insertErrors?.length > 0) {
      console.error("Insert errors:", insertResult.insertErrors);
      return {
        status: 500,
        message: "Some rows failed to insert",
        error: JSON.stringify(insertResult.insertErrors),
        rowsInserted: rows.length - insertResult.insertErrors.length,
        errors: insertResult.insertErrors,
      };
    }

    console.log(`Successfully inserted ${rows.length} rows`);
    return {
      status: 200,
      message: "Data inserted successfully",
      rowsInserted: rows.length,
    };

  } catch (error) {
    console.error("Error inserting data:", error);
    return {
      status: 500,
      message: "Error inserting data to BigQuery",
      error: error.message,
    };
  }
}

/**
 * Main function: Creates/replaces table and optionally inserts data
 * @param {Object} value - Configuration object
 * @param {string} value.dataset - Dataset ID
 * @param {string} value.table_name - Table ID
 * @param {Array} value.table - Array of data rows
 * @param {Array} [value.cluster] - Optional clustering fields
 * @param {boolean} [value.insert_data=true] - Whether to insert data (default: true)
 * @returns {Object} Status response
 */
async function handleBqTableCreation(value) {
  try {
    // Create or replace table
    const createResult = await createBqTable(value);
    
    if (createResult.status !== 200) {
      return createResult;
    }

    // Insert data by default (unless explicitly disabled)
    const shouldInsertData = value.insert_data !== false && value.table?.length > 0;

    if (!shouldInsertData) {
      return createResult;
    }

    // Insert the data
    const insertResult = await insertDataToBqTable(
      value.dataset,
      value.table_name,
      value.table
    );

    return {
      ...createResult,
      dataInsertion: insertResult,
    };

  } catch (error) {
    console.error("Error in handleBqTableCreation:", error);
    return {
      status: 500,
      message: "Error handling BigQuery table creation",
      error: error.message,
    };
  }
}

module.exports = {
  createBqTable,
  handleBqTableCreation,
};
