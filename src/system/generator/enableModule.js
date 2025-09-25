'use strict';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
const __dirname = new URL('.', import.meta.url).pathname;

import { exec } from 'node:child_process';

const CURR_DIR = process.cwd();
const templatePath = `${__dirname}/directory`;

export default async function (processAction) {
  if (processAction === 'socket') {
    console.log('Socket module enabling...');
    await installPackage('socket.io');

    const socketImportFilePath = path.join(__dirname, '../../app.js');

    // The code you want to insert
    const socketImportContent =
      "import SocketEvent from './system/event/socketEvent.js';";
    const socketCreateServerContent = 'SocketEvent.init(httpServer);';
    const importMarker = "// Enable Socket Here (Don't remove this line)";
    const createServerMarker =
      "// Create Socket Server Here (Don't remove this line)";
    let content = fs.readFileSync(socketImportFilePath, 'utf8');
    const importIndex = content.indexOf(importMarker);
    const createServerIndex = content.indexOf(createServerMarker);
    if (importIndex !== -1 && createServerIndex !== -1) {
      // Insert above the marker
      content = content.replace(createServerMarker, socketCreateServerContent);

      // Insert above the marker
      content = content.replace(importMarker, socketImportContent);

      // Write back updated file
      fs.writeFileSync(socketImportFilePath, content, 'utf8');
      console.log('Imports inserted successfully above marker!');
    } else {
      console.log('Marker not found!');
    }
  } else if (processAction === 'redis') {
    console.log('Redis module enabling...');
    await installPackage('redis');
    const sourceConfig = path.join(
      __dirname,
      './directory/config/redis.config.js'
    ); // source folder
    const destinationConfig = path.join(CURR_DIR, 'src/config/redis.config.js'); // destination folder
    copyFile(sourceConfig, destinationConfig);
    const sourceHelper = path.join(__dirname, './directory/helpers/redis.js'); // source folder
    const destinationHelper = path.join(CURR_DIR, 'src/helpers/redis.js'); // destination folder
    copyFile(sourceHelper, destinationHelper);
    const sourceLibrary = path.join(
      __dirname,
      './directory/libraries/redis.library.js'
    ); // source folder
    const destinationLibrary = path.join(
      CURR_DIR,
      'src/libraries/redis.library.js'
    ); // destination folder
    copyFile(sourceLibrary, destinationLibrary);

    const redisAuthMiddlewarePath = path.join(
      CURR_DIR,
      'src/app/middlewares/auth.middleware.js'
    );

    const importRedisLibraryMarker =
      "// Import Redis Library Here (Don't remove this line)";

    const importRedisLibraryContent = `import {
      keyExists,
      setValue,
      getValue,
    } from '../../libraries/redis.library.js';`;

    let content = fs.readFileSync(redisAuthMiddlewarePath, 'utf8');
    const importIndex = content.indexOf(importRedisLibraryMarker);
    if (importIndex !== -1) {
      // Insert above the marker
      content = content.replace(
        importRedisLibraryMarker,
        importRedisLibraryContent
      );

      // Write back updated file
      fs.writeFileSync(redisAuthMiddlewarePath, content, 'utf8');
      console.log('Imports inserted successfully above marker!');
    } else {
      console.log('Marker not found!');
    }
  } else if (processAction === 'kafka') {
    console.log('Kafkajs module enabling...');
    await installPackage('kafkajs');
    const source = path.join(__dirname, './directory/kafka'); // source folder
    const destination = path.join(CURR_DIR, 'src/kafka'); // destination folder
    copyFilesWithDirectory(source, destination);
  } else if (processAction === 'neo4j') {
    console.log('Neo4j module enabling...');
    await installPackage('neo4j-driver');
    const source = path.join(__dirname, './directory/neo4j'); // source folder
    const destination = path.join(CURR_DIR, 'src/neo4j'); // destination folder
    copyFilesWithDirectory(source, destination);
  }
}

const installPackage = async (packageName) => {
  exec(`npm install ${packageName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing package: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    //console.log(`stdout: ${stdout}`);
    console.log(`${packageName} installed successfully!`);
  });
};

const copyFilesWithDirectory = async (source, destination) => {
  fs.cp(source, destination, { recursive: true }, (err) => {
    if (err) {
      console.error('Error copying folder:', err);
    } else {
      console.log('Folder copied successfully!');
    }
  });
};

const copyFile = async (sourceFile, destinationFile) => {
  fs.copyFile(sourceFile, destinationFile, (err) => {
    if (err) {
      console.error('Error copying file:', err);
    } else {
      const file = destinationFile.split('/src/')[1];
      console.log(`File ${file} copied successfully!`);
    }
  });
};

const writeOnFile = async (filePath, marker, replaceContent) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const importIndex = content.indexOf(marker);
  if (importIndex !== -1) {
    // Insert above the marker
    content = content.replace(marker, replaceContent);

    // Write back updated file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Imports inserted successfully above marker!');
  } else {
    console.log('Marker not found!');
  }
};
