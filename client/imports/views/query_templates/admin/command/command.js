import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import { Communicator } from '/client/imports/facades';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';
import { $ } from 'meteor/jquery';
import Enums from '/lib/imports/enums';

import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import './command.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.command.onRendered(() => {
  Helper.initializeCodeMirror($('#divCommand'), 'txtCommand');
  Helper.changeRunOnAdminOptionVisibility(true);

  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbCommandOptions');
  $.each(Helper.sortObjectByKey(Enums.COMMAND_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.command.executeQuery = function () {
  initExecuteQuery();
  let command = Helper.getCodeMirrorValue($('#divCommand'));
  const options = {};

  if ($.inArray('MAX_TIME_MS', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    const maxTimeMsVal = $('#inputMaxTimeMs').val();
    if (maxTimeMsVal) {
      options[Enums.COMMAND_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMsVal);
    }
  }

  command = Helper.convertAndCheckJSON(command);
  if (command.ERROR) {
    toastr.error(`Syntax error on command: ${command.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

  Communicator.call({
    methodName: 'command',
    args: { command, runOnAdminDB, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
