package config

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func NewS3Client(accessKey, secretKey string) *s3.Client {

	cfg := aws.Config{
		Region: "ru-central1",
		Credentials: credentials.NewStaticCredentialsProvider(
			accessKey,
			secretKey,
			"",
		),
		BaseEndpoint: aws.String("https://storage.yandexcloud.net"),
	}

	return s3.NewFromConfig(cfg)
}
