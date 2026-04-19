package service

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type UploadService struct {
	client *s3.Client
	bucket string
}

func NewUploadService(client *s3.Client, bucket string) *UploadService {
	return &UploadService{
		client: client,
		bucket: bucket,
	}
}

func (s *UploadService) UploadImage(file multipart.File, filename string) (string, error) {

	ctx := context.Background()

	key := fmt.Sprintf("photos/%d_%s", time.Now().Unix(), filename)

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &s.bucket,
		Key:    &key,
		Body:   file,
	})
	if err != nil {
		return "", err
	}

	// публичная ссылка
	url := fmt.Sprintf("https://storage.yandexcloud.net/%s/%s", s.bucket, key)

	return url, nil
}
