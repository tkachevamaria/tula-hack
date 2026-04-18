package service

type PreferencesRepository interface {
	SavePreferences(userID int, preferredType string, minAge int, maxAge int, preferredBreed string, preferredLocation string) error
	GetPreferences(userID int) (map[string]interface{}, error)
}

type PreferencesService struct {
	repo PreferencesRepository
}

func NewPreferencesService(r PreferencesRepository) *PreferencesService {
	return &PreferencesService{repo: r}
}

func (s *PreferencesService) SetPreferences(
	userID int,
	preferredType string,
	minAge int,
	maxAge int,
	preferredBreed string,
	preferredLocation string,
) error {

	return s.repo.SavePreferences(
		userID,
		preferredType,
		minAge,
		maxAge,
		preferredBreed,
		preferredLocation,
	)
}

func (s *PreferencesService) GetPreferences(userID int) (map[string]interface{}, error) {
	return s.repo.GetPreferences(userID)
}
