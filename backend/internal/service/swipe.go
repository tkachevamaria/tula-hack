package service

type SwipeRepository interface {
	CreateSwipe(userID, petID int, isLike bool) error
	CreateOwnerSwipe(ownerID, userID, petID int, isLike bool) error
	HasOwnerLike(userID, petID int) (bool, error)
	HasUserLike(userID, petID int) (bool, error)
	CreateMatch(userID, petID int) error
	GetPetMode(petID int) (string, error)
	GetMatches(userID int) ([]map[string]interface{}, error)
}

type SwipeService struct {
	repo SwipeRepository
}

func NewSwipeService(r SwipeRepository) *SwipeService {
	return &SwipeService{repo: r}
}

func (s *SwipeService) Swipe(userID, petID int, isLike bool) (bool, error) {

	err := s.repo.CreateSwipe(userID, petID, isLike)
	if err != nil {
		return false, err
	}

	if !isLike {
		return false, nil
	}

	mode, err := s.repo.GetPetMode(petID)
	if err != nil {
		return false, err
	}

	// OPEN → сразу матч
	if mode == "open" {
		err = s.repo.CreateMatch(userID, petID)
		return true, err
	}

	// STRICT → проверяем owner
	hasOwnerLike, err := s.repo.HasOwnerLike(userID, petID)
	if err != nil {
		return false, err
	}

	if hasOwnerLike {
		err = s.repo.CreateMatch(userID, petID)
		return true, err
	}

	return false, nil
}

func (s *SwipeService) OwnerSwipe(ownerID, userID, petID int, isLike bool) (bool, error) {

	err := s.repo.CreateOwnerSwipe(ownerID, userID, petID, isLike)
	if err != nil {
		return false, err
	}

	if !isLike {
		return false, nil
	}

	hasUserLike, err := s.repo.HasUserLike(userID, petID)
	if err != nil {
		return false, err
	}

	if hasUserLike {
		err = s.repo.CreateMatch(userID, petID)
		return true, err
	}

	return false, nil
}

// matches
func (s *SwipeService) GetMatches(userID int) ([]map[string]interface{}, error) {
	return s.repo.GetMatches(userID)
}
