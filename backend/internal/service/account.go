package service

import "github.com/tkachevamaria/tula-hack/backend/internal/model"

type AccountRepository interface {
	GetByID(id int) (model.Account, error)
	Update(id int, displayName, bio, location string) error
}

type AccountService struct {
	repo AccountRepository
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
