package repository

import (
	"database/sql"

	"github.com/tkachevamaria/tula-hack/backend/internal/model"
)

type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CreateAccount(email, passwordHash, role, displayName string) (int, error) {

	query := `
		INSERT INTO accounts (email, password_hash, role, display_name)
		VALUES (?, ?, ?, ?)
	`

	result, err := r.db.Exec(query, email, passwordHash, role, displayName)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id), nil
}

func (r *AuthRepository) GetAccountByEmail(email string) (model.Account, error) {

	query := `
		SELECT id, email, password_hash, role, display_name
		FROM accounts
		WHERE email = ?
	`

	var acc model.Account

	err := r.db.QueryRow(query, email).Scan(
		&acc.ID,
		&acc.Email,
		&acc.PasswordHash,
		&acc.Role,
		&acc.DisplayName,
	)

	if err != nil {
		return model.Account{}, err
	}

	return acc, nil
}
