module.exports = function (runtime, global) {
    // const
    let keyMappings = {
      // 稳定模式
      'stable_mode': 'key_stable_mode',
      // 使用Root权限启用无障碍服务
      'enable_accessibility_service_by_root': 'key_enable_accessibility_service_by_root',
      // 音量上键停止所有脚本
      'stop_all_on_volume_up': 'key_use_volume_control_running',
      // 启动时不显示日志界面
      'not_show_console': 'key_dont_show_main_activity',
      // 前台服务
      'foreground_service': 'key_foreground_service'
    };

    let pref = com.stardust.autojs.core.pref.Pref.INSTANCE;

    function $settings() {
    }

    $settings.isEnabled = function (key) {
      if (keyMappings.hasOwnProperty(key)) {
        key = keyMappings[key];
      }
      return pref.isEnabled(key);
    }

    $settings.setEnabled = function (key, value) {
      if (keyMappings.hasOwnProperty(key)) {
        key = keyMappings[key];
      }
      pref.setEnabled(key, value);
    }

    return $settings;
}