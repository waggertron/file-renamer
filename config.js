module.exports = {
  targetFolders: [
    '/Users/weylin/coding/weyflix/file-renamer/test-folder',
  ],
  transformers: [
    {
      matcher: /www\s{0,}\.?\s{0,}scenetime\s{0,}\.?\s{0,}com\s?-\s?/i,
      replacer: '',
    },
  ],
};

