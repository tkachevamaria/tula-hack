package service

type PhotoRepository interface {
	AddPetPhoto(petID int, url string) error
	AddAccountPhoto(accountID int, url string, isMain bool) error
	GetPetPhotos(petID int) ([]string, error)
}

type PhotoService struct {
	repo PhotoRepository
}

func NewPhotoService(r PhotoRepository) *PhotoService {
	return &PhotoService{repo: r}
}

func (s *PhotoService) AddPetPhoto(petID int, url string) error {
	return s.repo.AddPetPhoto(petID, url)
}

func (s *PhotoService) GetPetPhotos(petID int) ([]string, error) {
	return s.repo.GetPetPhotos(petID)
}
