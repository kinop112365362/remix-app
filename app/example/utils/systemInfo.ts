function getRegion(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [continent, country] = timeZone.split('/');
  return country || continent || 'Unknown';
}

export async function getSystemInfo() {
  return {
    platform: navigator.platform,
    osVersion: 'Unknown', // Browser doesn't provide OS version
    architecture: 'Unknown', // Browser doesn't provide architecture info
    cpuModel: 'Unknown', // Browser doesn't provide CPU model
    cpuSpeed: 'Unknown', // Browser doesn't provide CPU speed
    cpuCores: navigator.hardwareConcurrency || 'Unknown',
    totalMemory: 'Unknown', // Browser doesn't provide total memory
    freeMemory: 'Unknown', // Browser doesn't provide free memory
    region: getRegion(),
  };
}