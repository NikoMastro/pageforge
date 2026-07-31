// Lightweight local groups service (front-end only)
// Persists groups to localStorage so grouping survives page reloads.
// Shape aligns with usages in JsonCardsGroup component.

export interface CardGroupDTO {
  id: string;
  name: string;
  description?: string;
  color: string;
  cardIds: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'json-card-groups';

function nowIso(): string { return new Date().toISOString(); }

function loadAll(): CardGroupDTO[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CardGroupDTO[];
    return [];
  } catch { return []; }
}

function saveAll(groups: CardGroupDTO[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)); } catch { /* ignore quota */ }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID();
  return 'grp_' + Math.random().toString(36).slice(2, 10);
}

async function getAllGroups(): Promise<CardGroupDTO[]> {
  return loadAll();
}

async function createGroup(name: string, color: string, description?: string): Promise<CardGroupDTO> {
  const groups = loadAll();
  const group: CardGroupDTO = { id: uuid(), name, description, color, cardIds: [], createdAt: nowIso(), updatedAt: nowIso() };
  groups.push(group);
  saveAll(groups);
  return group;
}

async function updateGroup(id: string, changes: Partial<Pick<CardGroupDTO, 'name' | 'description' | 'color'>>): Promise<CardGroupDTO | null> {
  const groups = loadAll();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return null;
  groups[idx] = { ...groups[idx], ...changes, updatedAt: nowIso() };
  saveAll(groups);
  return groups[idx];
}

async function deleteGroup(id: string): Promise<boolean> {
  const groups = loadAll();
  const next = groups.filter(g => g.id !== id);
  const changed = next.length !== groups.length;
  if (changed) saveAll(next);
  return changed;
}

async function addCardToGroup(groupId: string, cardId: string): Promise<boolean> {
  const groups = loadAll();
  const g = groups.find(gr => gr.id === groupId);
  if (!g) return false;
  if (!g.cardIds.includes(cardId)) {
    g.cardIds.push(cardId);
    g.updatedAt = nowIso();
    saveAll(groups);
  }
  return true;
}

async function removeCardFromGroup(groupId: string, cardId: string): Promise<boolean> {
  const groups = loadAll();
  const g = groups.find(gr => gr.id === groupId);
  if (!g) return false;
  const before = g.cardIds.length;
  g.cardIds = g.cardIds.filter(id => id !== cardId);
  if (g.cardIds.length !== before) {
    g.updatedAt = nowIso();
    saveAll(groups);
    return true;
  }
  return false;
}

async function removeCardFromAllGroups(cardId: string): Promise<void> {
  const groups = loadAll();
  let changed = false;
  groups.forEach(g => {
    const before = g.cardIds.length;
    g.cardIds = g.cardIds.filter(id => id !== cardId);
    if (g.cardIds.length !== before) { g.updatedAt = nowIso(); changed = true; }
  });
  if (changed) saveAll(groups);
}

const groupsService = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addCardToGroup,
  removeCardFromGroup,
  removeCardFromAllGroups,
};

export default groupsService;
