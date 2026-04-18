package service

import (
	"errors"

	"github.com/tkachevamaria/tula-hack/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
)

type AuthRepository interface {
	CreateAccount(email, passwordHash, role, displayName string) (int, error)
	GetAccountByEmail(email string) (model.Account, error)
}

type AuthService struct {
	repo AuthRepository
}

func NewAuthService(repo AuthRepository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(email, password, role, displayName string) (int, error) {

	// 1. валидация (минимум)
	if email == "" || password == "" {
		return 0, errors.New("email and password required")
	}

	// 2. хешируем пароль
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return 0, err
	}

	// 3. создаём пользователя
	if role != "user" && role != "shelter" {
		return 0, errors.New("invalid role")
	}

	if displayName == "" {
		return 0, errors.New("display name required")
	}

	userID, err := s.repo.CreateAccount(
		email,
		string(hash),
		role,
		displayName,
	)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

func (s *AuthService) Login(email, password string) (model.Account, error) {

	account, err := s.repo.GetAccountByEmail(email)
	if err != nil {
		return model.Account{}, errors.New("invalid email or password")
	}

	// сравниваем пароль
	err = bcrypt.CompareHashAndPassword(
		[]byte(account.PasswordHash),
		[]byte(password),
	)

	if err != nil {
		return model.Account{}, errors.New("invalid email or password")
	}

	return account, nil
}
