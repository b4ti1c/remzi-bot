'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('remzi::image-manager');
const Converter = new require('iconv').Iconv('ISO-8859-9', 'UTF-8');
const mmm = require('mmmagic');
const MimeDetector = new mmm.Magic(mmm.MAGIC_MIME_TYPE);


class ImageManager {
    constructor() {}

    search(term) {
        debug('Searching', term);
        const url = `https://www.google.com.tr/search?tbm=isch&q=${term}`;

        return new Promise((resolve, reject) => 
            https
                .get(url, response => {
                    let body = [];

                    response
                        .on('data', chunk => body.push(chunk))
                        .on('end', _ => resolve(Converter.convert(Buffer.concat(body)).toString()))
                        .on('error', reject);
                })
                .on('error', reject)
        )
        .then(responseHtml => {
            let regex = new RegExp(`<img[^<>]*${term} ile ilgili görsel sonucu[^<>]*>`, 'g');
            let imageElements = responseHtml.match(regex);
            debug(imageElements);

            let src = imageElements[0].match(/src="([^"]*)"/)[1];
            debug(src);
            return src;
        })
    }

    download(src) {
        debug('Downloading', src);
        let filePath = '';

        return new Promise((resolve, reject) => {
            let filename = Date.now().toString();
            filePath = path.join('/tmp', filename);
            let file = fs.createWriteStream(filePath);

            https
                .get(src, response => {
                    response.pipe(file);
                    file.on('finish', _ => file.close(resolve))
                })
                .on('error', reject);
        })
        .then(_ => new Promise((resolve, reject) => MimeDetector.detectFile(filePath, (err, mimeType) => {
            if (err) return reject(err);
            
            let extension = '';
            switch(mimeType) {
                case 'image/jpeg':
                case 'image/jpg':
                case 'image/gif':
                case 'image/png':
                case 'image/tiff':
                case 'image/bmp':
                    extension = mimeType.slice(6);
                    break;
                default:
                    return reject(new Error(`Unsupported image type which is ${mimeType}`));
            }

            resolve(extension);
        })))
        .then(ext => new Promise((resolve, reject) => fs.rename(filePath, filePath + '.' + ext, err => {
            if (err) return reject(err);
            filePath = filePath + '.' + ext;
            resolve();
        })))
        .catch(err => {
            this.delete(filePath);
            return Promise.reject(err);
        })
        .then(_ => filePath)
    }

    delete(filePath) {
        debug('Deleting', filePath);
        return new Promise((resolve, reject) => fs.unlink(filePath, err => {
            if (err) reject(err)
            else resolve();
        }));
    }
}


module.exports = new ImageManager();
