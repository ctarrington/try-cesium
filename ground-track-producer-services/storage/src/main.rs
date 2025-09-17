use axum::{
    body::Bytes,
    http::{header, StatusCode},
    routing::post,
    Router,
};
use tokio::fs;

async fn upload_image_direct(headers: header::HeaderMap, raw_image_data: Bytes) -> Result<String, StatusCode> {
    let content_type = headers.get(header::CONTENT_TYPE)
        .and_then(|h| h.to_str().ok())
        .unwrap_or("application/octet-stream");

    if content_type.starts_with("image/") {
        let file_extension = content_type.split('/').nth(1).unwrap_or("bin");
        let path = format!("./uploads/uploaded_image.{}", file_extension);

        fs::write(&path, &raw_image_data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        println!("Image uploaded directly: ({} bytes)", raw_image_data.len());
        Ok(format!("Image saved as: {}", path))
    } else {
        Err(StatusCode::BAD_REQUEST)
    }
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/store_image", post(upload_image_direct));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}