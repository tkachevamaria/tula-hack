package repository

import (
	"database/sql"
)

type PreferencesRepository struct {
	db *sql.DB
}

func NewPreferencesRepository(db *sql.DB) *PreferencesRepository {
	return &PreferencesRepository{db: db}
}

func (r *PreferencesRepository) SavePreferences(
	userID int,
	preferredType string,
	minAge int,
	maxAge int,
	preferredBreed string,
	preferredLocation string,
) error {

	query := `
	INSERT INTO user_preferences (
		user_id, preferred_type, min_age, max_age, preferred_breed, preferred_location
	) VALUES (?, ?, ?, ?, ?, ?)
	ON CONFLICT(user_id) DO UPDATE SET
		preferred_type = excluded.preferred_type,
		min_age = excluded.min_age,
		max_age = excluded.max_age,
		preferred_breed = excluded.preferred_breed,
		preferred_location = excluded.preferred_location
	`

	_, err := r.db.Exec(
		query,
		userID,
		preferredType,
		minAge,
		maxAge,
		preferredBreed,
		preferredLocation,
	)

	return err
}

func (r *PreferencesRepository) GetPreferences(userID int) (map[string]interface{}, error) {

	query := `
	SELECT preferred_type, min_age, max_age, preferred_breed, preferred_location
	FROM user_preferences
	WHERE user_id = ?
	`

	var pType, breed, location sql.NullString
	var minAge, maxAge sql.NullInt64

	err := r.db.QueryRow(query, userID).Scan(
		&pType,
		&minAge,
		&maxAge,
		&breed,
		&location,
	)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"preferred_type":     pType.String,
		"min_age":            minAge.Int64,
		"max_age":            maxAge.Int64,
		"preferred_breed":    breed.String,
		"preferred_location": location.String,
	}, nil
}
