import * as monaco from 'monaco-editor';

// Configure Monaco Editor to use CDN in development and local files in production
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    // Use CDN for development
    if (import.meta.env.DEV) {
      return `https://unpkg.com/monaco-editor@0.52.2/min/vs/base/worker/workerMain.js`;
    }
    
    // For production, use local files
    return `/monaco-editor/vs/base/worker/workerMain.js`;
  }
};

export default monaco; 