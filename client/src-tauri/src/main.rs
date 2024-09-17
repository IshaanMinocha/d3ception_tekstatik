use std::env;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::Manager;
use std::collections::HashMap;

struct Storage(Mutex<HashMap<String, String>>);

#[tauri::command]
fn get_storage_item(key: String, state: tauri::State<'_, Storage>) -> Option<String> {
    state.0.lock().unwrap().get(&key).cloned()
}

#[tauri::command]
fn set_storage_item(key: String, value: String, state: tauri::State<'_, Storage>) {
    state.0.lock().unwrap().insert(key, value);
}

#[tauri::command]
async fn start_backend(app: tauri::AppHandle) -> Result<(), String> {
    let server_path = env::var("SERVER_PATH").unwrap_or_else(|_| "../../../backend/server.js".to_string());
    
    let child = Command::new("node")
        .arg(&server_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    app.manage(child);

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(Storage(Mutex::new(HashMap::new())))
        .setup(|app| {
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = start_backend(app_handle).await {
                    eprintln!("Failed to start backend: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_storage_item,
            set_storage_item,
            start_backend
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}