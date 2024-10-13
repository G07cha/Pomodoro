import { message } from '@tauri-apps/plugin-dialog';
import { getCurrentWebview } from '@tauri-apps/api/webview';

import * as theme from '../../utils/theme';
import { Duration } from '../../utils/duration';
import { disableContextMenu } from '../../utils/dom';

import { SettingsUIController } from './settings.view';
import { Settings, SettingsService } from './settings.service';

const webview = getCurrentWebview();

theme.followSystemTheme();
disableContextMenu();

const settingsService = new SettingsService();
const settings = await settingsService.getSettings();
const settingsUI = new SettingsUIController();

settingsUI.setFormValues({
  ...settings,
  workDuration: settings.workDuration.mins,
  relaxDuration: settings.relaxDuration.mins,
  longRelaxDuration: settings.longRelaxDuration.mins,
});

webview.window.onCloseRequested(async () => {
  const formValues = settingsUI.getFormValues();
  const newSettings: Settings = {
    ...settings,
    autostart: formValues.autostart,
    workDuration: Duration.fromMins(formValues.workDuration),
    relaxDuration: Duration.fromMins(formValues.relaxDuration),
    longRelaxDuration: Duration.fromMins(formValues.longRelaxDuration),
    toggleTimerShortcut: formValues.toggleTimerShortcut,
    shouldPlaySound: formValues.shouldPlaySound,
  };

  if (JSON.stringify(newSettings) !== JSON.stringify(settings)) {
    try {
      await settingsService.setSettings(newSettings);
    } catch (error) {
      message(`${error}`, { kind: 'error', title: 'Unable to save settings' });
    }
  }

  webview.window.hide();
});
