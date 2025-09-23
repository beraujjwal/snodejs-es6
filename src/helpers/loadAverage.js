import os from 'os';

export const serverIsFree = async (avg = 0.7) => {
  const load = os.loadavg()[0]; // 1-min load average
  const cores = os.cpus().length;
  return load / cores < avg; // less than 70% CPU
};
