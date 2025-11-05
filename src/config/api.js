// Centralized API configuration
// Prefer configuring via environment variable REACT_APP_S3_API_BASE.
// Fallback to the current default if not provided.

export const S3_API_BASE =
	process.env.REACT_APP_S3_API_BASE ||
	"https://q5c7u5zmzc4l7r4warc6oslx4e0bgoqd.lambda-url.us-east-2.on.aws/api/s3";
