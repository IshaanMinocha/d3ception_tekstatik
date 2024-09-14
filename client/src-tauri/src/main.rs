#[tauri::command]
async fn start_backend() -> Result<(), String> {
    use std::process::Command;

    Command::new("node")
        .arg("../../../backend/server.js")
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_backend])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}