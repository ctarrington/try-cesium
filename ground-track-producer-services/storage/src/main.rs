use axum::extract::{Path, Request};
use axum::{
    Router,
    body::Bytes,
    http::{StatusCode, header},
    routing::post,
};
use futures_util::TryStreamExt;
use http::Method;
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use tokio::fs;
use tower_http::cors::{Any, CorsLayer};

const UPLOADS_DIRECTORY: &str = "uploads";

async fn store_image(
    Path(tick): Path<String>,
    headers: header::HeaderMap,
    raw_image_data: Bytes,
) -> Result<String, StatusCode> {
    let content_type = headers
        .get(header::CONTENT_TYPE)
        .and_then(|h| h.to_str().ok())
        .unwrap_or("application/octet-stream");

    if content_type.starts_with("image/") {
        let path = format!("./{}/image_{}.{}", UPLOADS_DIRECTORY, tick, "png");

        fs::write(&path, &raw_image_data)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        println!("Image uploaded directly: ({} bytes)", raw_image_data.len());
        Ok(format!("Image saved as: {}", path))
    } else {
        Err(StatusCode::BAD_REQUEST)
    }
}

async fn store_metadata(Path(tick): Path<String>, body: String) -> Result<String, StatusCode> {
    let path = format!("./{}/metadata_{}.json", UPLOADS_DIRECTORY, tick);
    let content = body;
    let bytes = Bytes::from(content);
    let length = bytes.len();
    fs::write(&path, bytes)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    println!("Metadata uploaded : ({} bytes)", length);
    Ok(format!("Metadata saved as: {}", path))
}

#[tokio::main]
async fn main() {
    let cors_layer = CorsLayer::new()
        .allow_methods([Method::POST]) // Allow only POST requests
        .allow_origin(Any) // Allow requests from any origin
        .allow_headers([AUTHORIZATION, CONTENT_TYPE]); // Allow specific headers

    let app = Router::new()
        .route("/store_image/{tick}", post(store_image))
        .route("/store_metadata/{tick}", post(store_metadata))
        .layer(cors_layer);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
