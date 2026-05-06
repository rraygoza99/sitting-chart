// Centralized API configuration
// Prefer configuring via environment variable REACT_APP_S3_API_BASE.
// Fallback to the current default if not provided.

export const S3_API_BASE =
	process.env.REACT_APP_S3_API_BASE ||
	"https://q5c7u5zmzc4l7r4warc6oslx4e0bgoqd.lambda-url.us-east-2.on.aws/api/s3";

// Base URL for the Weddings REST API (ASP.NET minimal API).
// Set REACT_APP_WEDDINGS_API_BASE in your .env file, e.g.:
//   REACT_APP_WEDDINGS_API_BASE=https://api.myapp.com
export const WEDDINGS_API_BASE =
	process.env.REACT_APP_WEDDINGS_API_BASE || "";
