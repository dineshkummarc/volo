/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

'use strict';
/*jslint */
/*global define, console, process */

define(function (require, exports, module) {
    var fs = require('fs'),
        q = require('q'),
        path = require('path'),
        add = require('add'),
        baseUrl = require('volo/baseUrl'),
        acquire;

    acquire = {
        summary: 'Adds a new command to volo.',

        doc: require('text!./acquire/doc.md'),

        flags: add.flags,

        validate: function (namedArgs, appName) {
            return add.validate.apply(add, arguments);
        },

        run: function (deferred, v, namedArgs, packageName, localName) {
            //Create a 'vololib' directory as a sibling to the volo file
            var targetDir = baseUrl,
                cwd = process.cwd(),
                d = q.defer(),
                args = [].slice.call(arguments, 0);

            //Swap in our deferred
            args[0] = d;

            //Create sibling directory to this file to store the
            //new command implementation.
            if (!path.existsSync(targetDir)) {
                fs.mkdirSync(targetDir);
            }

            process.chdir(targetDir);

            function finish(result) {
                process.chdir(cwd);
            }

            //Update the namedArgs to indicate amd is true for volo
            namedArgs.amd = true;

            add.run.apply(add, args);

            q.when(d.promise, function (result) {
                finish();
                deferred.resolve(result + '\nNew volo command aquired!');
            }, function (err) {
                finish();
                deferred.reject(err);
            });
        }
    };

    return require('volo/commands').register(module.id, acquire);
});
