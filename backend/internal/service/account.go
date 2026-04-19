package service

import "github.com/tkachevamaria/tula-hack/backend/internal/model"

type AccountRepository interface {
	GetByID(id int) (model.Account, error)
	Update(id int, displayName, bio, location string) error
}

type AccountService struct {
	repo AccountRepository
}

type PublicAccount struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	Location    string `json:"location"`
}

func NewAccountService(r AccountRepository) *AccountService {
	return &AccountService{repo: r}
}

func (s *AccountService) GetMe(userID int) (model.Account, error) {
	return s.repo.GetByID(userID)
}

func (s *AccountService) UpdateMe(userID int, displayName, bio, location string) error {

	// можно добавить простую валидацию
	if displayName == "" {
		return nil // не обновляем если пусто (или ошибка — на твой выбор)
	}

	return s.repo.Update(userID, displayName, bio, location)
}

func (s *AccountService) GetUserByID(id int) (PublicAccount, error) {

	acc, err := s.repo.GetByID(id)
	if err != nil {
		return PublicAccount{}, err
	}

	return PublicAccount{
		ID:          acc.ID,
		Email:       acc.Email,
		Role:        acc.Role,
		DisplayName: acc.DisplayName,
		Bio:         acc.Bio,
		Location:    acc.Location,
	}, nil
}
