
import { FileSystemNode } from '../types';

const FS_STORAGE_KEY = 'xline_fs_v3';

const initialFS: FileSystemNode = {
  id: 'root',
  name: '/',
  type: 'DIRECTORY',
  parentId: null,
  permissions: 'rwxr-xr-x',
  createdAt: Date.now(),
  size: 4096,
  children: [
    {
      id: 'home',
      name: 'home',
      type: 'DIRECTORY',
      parentId: 'root',
      permissions: 'rwxr-xr-x',
      createdAt: Date.now(),
      size: 4096,
      children: [
        {
          id: 'user',
          name: 'user',
          type: 'DIRECTORY',
          parentId: 'home',
          permissions: 'rwxr-xr-x',
          createdAt: Date.now(),
          size: 4096,
          children: [
            {
              id: 'docs',
              name: 'documents',
              type: 'DIRECTORY',
              parentId: 'user',
              permissions: 'rwxr-xr-x',
              createdAt: Date.now(),
              size: 4096,
              children: []
            },
            {
              id: 'downloads',
              name: 'downloads',
              type: 'DIRECTORY',
              parentId: 'user',
              permissions: 'rwxr-xr-x',
              createdAt: Date.now(),
              size: 4096,
              children: []
            },
            {
              id: 'images',
              name: 'images',
              type: 'DIRECTORY',
              parentId: 'user',
              permissions: 'rwxr-xr-x',
              createdAt: Date.now(),
              size: 4096,
              children: []
            },
            {
              id: 'projects',
              name: 'projects',
              type: 'DIRECTORY',
              parentId: 'user',
              permissions: 'rwxr-xr-x',
              createdAt: Date.now(),
              size: 4096,
              children: []
            },
            {
              id: 'welcome_txt',
              name: 'welcome.txt',
              type: 'FILE',
              parentId: 'user',
              permissions: 'rw-r--r--',
              createdAt: Date.now(),
              content: 'Welcome to XlineOS Aurora. This is a persistent virtual file system.',
              size: 64
            }
          ]
        }
      ]
    },
    {
      id: 'sys',
      name: 'sys',
      type: 'DIRECTORY',
      parentId: 'root',
      permissions: 'r-xr-xr-x',
      createdAt: Date.now(),
      size: 4096,
      children: []
    }
  ]
};

export const loadFileSystem = (): FileSystemNode => {
  const saved = localStorage.getItem(FS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("FS Corruption", e);
      return initialFS;
    }
  }
  return initialFS;
};

export const saveFileSystem = (root: FileSystemNode) => {
  try {
      localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(root));
  } catch (e) {
      console.error("Storage Limit Reached", e);
      alert("Storage Quota Exceeded! Cannot save file.");
  }
};

export const findNodeById = (root: FileSystemNode, id: string): FileSystemNode | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
};

export const deleteNode = (root: FileSystemNode, nodeId: string): FileSystemNode => {
    const newRoot = JSON.parse(JSON.stringify(root));
    
    const deleteRecursive = (node: FileSystemNode, targetId: string): boolean => {
        if (!node.children) return false;
        
        const index = node.children.findIndex(c => c.id === targetId);
        if (index !== -1) {
            node.children.splice(index, 1);
            return true;
        }
        
        for (const child of node.children) {
            if (deleteRecursive(child, targetId)) return true;
        }
        return false;
    };

    deleteRecursive(newRoot, nodeId);
    saveFileSystem(newRoot);
    return newRoot;
};

export const addFile = (root: FileSystemNode, parentId: string, name: string, content: string, mimeType?: string): FileSystemNode => {
  const newRoot = JSON.parse(JSON.stringify(root)); // Deep copy
  const parent = findNodeById(newRoot, parentId);
  if (parent && parent.type === 'DIRECTORY') {
    parent.children = parent.children || [];
    // Check if exists
    const existing = parent.children.find((c: any) => c.name === name);
    if (existing) {
        existing.content = content;
        existing.createdAt = Date.now();
        existing.mimeType = mimeType || existing.mimeType;
    } else {
        parent.children.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          type: 'FILE',
          parentId,
          permissions: 'rw-r--r--',
          createdAt: Date.now(),
          content,
          mimeType: mimeType || 'text/plain',
          size: content.length
        });
    }
    saveFileSystem(newRoot);
  }
  return newRoot;
};

export const createDirectory = (root: FileSystemNode, parentId: string, name: string): FileSystemNode => {
    const newRoot = JSON.parse(JSON.stringify(root));
    const parent = findNodeById(newRoot, parentId);
    if (parent && parent.type === 'DIRECTORY') {
        parent.children = parent.children || [];
        // Prevent duplicate folders
        if (!parent.children.some(c => c.name === name && c.type === 'DIRECTORY')) {
            parent.children.push({
                id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                type: 'DIRECTORY',
                parentId,
                permissions: 'rwxr-xr-x',
                createdAt: Date.now(),
                children: [],
                size: 4096
            });
            saveFileSystem(newRoot);
        }
    }
    return newRoot;
}
