package repository

import (
	"database/sql"

	"github.com/tkachevamaria/tula-hack/backend/internal/model"
)

type AccountRepository struct {
	db *sql.DB
}

func NewAccountRepository(db *sql.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) GetByID(id int) (model.Account, error) {
	query := `
        SELECT id, email, password_hash, role, display_name, 
               COALESCE(bio, '') as bio, 
               COALESCE(location, '') as location
        FROM accounts
        WHERE id = ?
    `

	var acc model.Account

	err := r.db.QueryRow(query, id).Scan(
		&acc.ID,
		&acc.Email,
		&acc.PasswordHash,
		&acc.Role,
		&acc.DisplayName,
		&acc.Bio,
		&acc.Location,
	)

	if err != nil {
		return model.Account{}, err
	}

	return acc, nil
}

func (r *AccountRepository) Update(id int, displayName, bio, location string) error {
	query := `
		UPDATE accounts
		SET display_name = ?, bio = ?, location = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(query, displayName, bio, location, id)
	return err
}
