const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const { targetFolders, transformers } = require('./config');

const getFolderContents = async dir => fs.readdirAsync(dir).map(file => `${dir}/${file}`);

const isDirectory = async (path) => {
  const stat = await fs.statAsync(path);
  return stat.isDirectory();
};

// const mapAsync = async (arr, promiseMapper) => Promise.all(arr.map(promiseMapper));
const mapAsync = async (arr, promiseMapper) => Promise.all(arr.map(promiseMapper));

const flatMapAsync = async (arr, promiseMapper) => {
  const results = [];
  for (let i = 0; i < arr.length; i += 1) {
    const item = arr[i];
    if (Array.isArray(item)) {
      const mapped = flatMapAsync(item, promiseMapper);
      results.push(...mapped);
    } else {
      const mapped = await promiseMapper(item);
      if (Array.isArray(mapped)) {
        results.push(...mapped);
      } else {
        results.push(mapped);
      }
    }
  }
  const end = await Promise.all(results);
  return end;
};

const filterAsync = async (arr, promiseFilter) => {
  const results = await mapAsync(arr, promiseFilter);
  return arr.filter((item, index) => results[index]);
};

const filterSplitAsync = async (arr, promiseFilter) => {
  const results = await mapAsync(promiseFilter);
  const passed = [];
  const failed = [];
  arr.forEach((item, index) => (results[index] ? passed.push(item) : failed.push(item)));
  return [passed, failed];
};

const rename = async (file) => {
  let newFileName = file;
  for (let i = 0; i < transformers.length; i += 1) {
    const { matcher, replacer } = transformers[i];
    if (file.match(matcher)) {
      newFileName = file.replace(matcher, replacer);
      break;
    }
  }
  await fs.renameAsync(file, newFileName);
  return newFileName;
};


const renameDirectoryFiles = async (folders) => {
  const contents = await flatMapAsync(folders, getFolderContents);
  const renamed = await mapAsync(contents, rename);
  const directories = await filterAsync(renamed, isDirectory);
  if (directories.length) {
    renameDirectoryFiles(directories);
  }
};

renameDirectoryFiles(targetFolders);

