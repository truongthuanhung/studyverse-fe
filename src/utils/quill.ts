export const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    // [{ color: [] }, { background: [] }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image', 'formula'],
    [{ align: [] }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

export const formats = [
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'align',
  'list',
  'bullet',
  'link',
  'image',
  'formula',
  'code-block',
  'blockquote',
  'color',
  'background',
  'mention'
];

export const cleanContent = (htmlContent: string): string => {
  let cleanedContent = htmlContent.trim();
  cleanedContent = cleanedContent.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '');
  return cleanedContent;
};