use std::env;
use std::process::{Command, Stdio};
use tauri::Manager;

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
        .setup(|app| {

            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = start_backend(app_handle).await {
                    eprintln!("Failed to start backend: {}", e);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}