#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::env::current_exe;
use std::sync::Mutex;
use tauri::{
  Manager,
  SystemTray,
  SystemTrayMenu,
  SystemTrayMenuItem,
  SystemTrayEvent,
  CustomMenuItem, WindowEvent,
};
use auto_launch::*;

struct MyState (Mutex<bool>);

#[tauri::command]
fn custom_command(app_handle: tauri::AppHandle, state: tauri::State<MyState>) {
  let mut is_enabled = state.0.lock().unwrap(); 
  *is_enabled = !is_enabled.clone();
  
  app_handle.tray_handle().get_item("autostart").set_selected(*is_enabled).unwrap();
}

#[tauri::command]
fn open_devtools(window: tauri::Window) {
  #[cfg(debug_assertions)] {
    window.open_devtools()
  }
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      // Only include this code if debug is enabled.
      // #[cfg(debug_assertions)] {
      //   let window = app.get_window("search-bar").unwrap();
      //   window.open_devtools();
      // }

      // #region Exit app when main window is closed.
      let search_bar_window = app.get_window("search-bar").unwrap();

      search_bar_window.on_window_event(|event| {
        match event {
          WindowEvent::Destroyed => std::process::exit(0),
          _ => (),
        }
      });
      // #endregion

      // #region Autostart
      let app_name = &app.package_info().name;
      let current_exe = current_exe().unwrap();

      let auto_start = AutoLaunchBuilder::new()
        .set_app_name(&app_name)
        .set_app_path(&current_exe.to_str().unwrap())
        .set_use_launch_agent(true)
        .build()
        .unwrap();

      #[cfg(not(debug_assertions))] {
        auto_start.enable().unwrap();
        println!("is autostart {}", auto_start.is_enabled().unwrap());
      }
      // #endregion

      Ok(())
    })
    .manage(MyState(false.into()))
    .invoke_handler(tauri::generate_handler![custom_command, open_devtools])
    .system_tray(SystemTray::new().with_menu(
      SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("autostart".to_string(),"Autostart"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("exit".to_string(), "Exit"))
    ))
    .on_system_tray_event(move |app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        size: _,
        ..
      } => {
        app.emit_to("search-bar", "tray:left-click", {}).unwrap();
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "autostart" => {
            custom_command(app.app_handle(), app.state())
          }
          "exit" => {
            std::process::exit(0);
          }
          _ => {}
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running application");
}
