export const downloadFile = (url: string) => {
  const fileName = url.split('/').pop() || 'download';
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
