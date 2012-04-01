#!/usr/bin/env node

'use strict';

var spawn = require('child_process').spawn
  , pipe  = require('../../lib/child_process/pipe');

pipe(spawn(__dirname + '/pipe-internal.js'));
