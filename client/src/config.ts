declare const process: {
  env: {
    REACT_APP_BASE_URL?: string;
  }
};

export const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000'; 