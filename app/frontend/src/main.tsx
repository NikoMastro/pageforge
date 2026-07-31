import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout";
// import App from "./app";
import LandingPagesPage from "./pages/landingPages/page";
import JsonPreview from "./pages/landingPages/[e]/page";
import LandingPageViewer from "./pages/landingPages/[e]/landingPage/page";
import TestPage from "./pages/devs/testComponents/page";
import TestLpsPage from "./pages/devs/testLps/page";
import SandboxPage from "./pages/devs/sandbox/page";
import TestLinkBioPage from "./pages/devs/testlinkbio/page";
import VideoGenerationPage from "./pages/vidGen/page";
import VideoGenerationDetailPage from "./pages/vidGen/[e]/page";
import ConfigsEditorPage from "./pages/configs/[e]/page";
import ConfigsListPage from "./pages/configs/page";
import UrlTesterPage from "./pages/url_tester/page";
import ExperimentsPage from "./pages/experiments/page";
import ExperimentDetailPage from "./pages/experiments/[e]/page";
import LinkBioPage from "./pages/linkbio/page";
import LinkBioEditorPage from "./pages/linkbio/[e]/page";
import LinkBioViewer from "./pages/linkbio/[e]/bioPage/page";
import LibraryPage from "./pages/library/page";
import LibraryEditorPage from "./pages/library/[e]/page";
import { AuthProvider } from "./components/layout/authContext";
import { RequireAllowed } from "./components/layout/authContext";
import "./styles/App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAllowed>
                <Layout>
                  <LandingPagesPage />
                </Layout>
              </RequireAllowed>
            }
          />
          {/* <Route
              path="/dashboard"
              element={
                <RequireAllowed>
                  <Layout>
                    <App />
                  </Layout>
                </RequireAllowed>
              }
            /> */}
          <Route
            path="/dev_components"
            element={
              <RequireAllowed>
                <Layout>
                  <TestPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/dev_lps"
            element={
              <RequireAllowed>
                <Layout>
                  <TestLpsPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/dev_sandbox"
            element={
              <RequireAllowed>
                <Layout>
                  <SandboxPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/dev_testlinkbio"
            element={
              <RequireAllowed>
                <Layout>
                  <TestLinkBioPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/vidGen"
            element={
              <RequireAllowed>
                <Layout>
                  <VideoGenerationPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/vidGen/:id"
            element={
              <RequireAllowed>
                <Layout>
                  <VideoGenerationDetailPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/configs"
            element={
              <RequireAllowed>
                <Layout>
                  <ConfigsListPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/configs/:name"
            element={
              <RequireAllowed>
                <Layout>
                  <ConfigsEditorPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/url-tester"
            element={
              <RequireAllowed>
                <Layout>
                  <UrlTesterPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/experiments"
            element={
              <RequireAllowed>
                <Layout>
                  <ExperimentsPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/experiments/:id"
            element={
              <RequireAllowed>
                <Layout>
                  <ExperimentDetailPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/linkbio"
            element={
              <RequireAllowed>
                <Layout>
                  <LinkBioPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/linkbio/:e/bioPage"
            element={
              <LinkBioViewer />
            }
          />
          <Route
            path="/linkbio/:e"
            element={
              <RequireAllowed>
                <Layout>
                  <LinkBioEditorPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/library"
            element={
              <RequireAllowed>
                <Layout>
                  <LibraryPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/library/:e"
            element={
              <RequireAllowed>
                <Layout>
                  <LibraryEditorPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/landing-pages"
            element={
              <RequireAllowed>
                <Layout>
                  <LandingPagesPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/landing-pages/:name"
            element={
              <RequireAllowed>
                <Layout>
                  <JsonPreview />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/LandingPages"
            element={
              <RequireAllowed>
                <Layout>
                  <LandingPagesPage />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route
            path="/LandingPages/:name"
            element={
              <RequireAllowed>
                <Layout>
                  <JsonPreview />
                </Layout>
              </RequireAllowed>
            }
          />
          <Route path="/landing/:name" element={<LandingPageViewer />} />
          <Route
            path="/json/:name"
            element={
              <RequireAllowed>
                <Layout>
                  <JsonPreview />
                </Layout>
              </RequireAllowed>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
