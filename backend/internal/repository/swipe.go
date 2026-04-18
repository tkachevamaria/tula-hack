package repository

import (
	"database/sql"
)

type SwipeRepository struct {
	db *sql.DB
}

func NewSwipeRepository(db *sql.DB) *SwipeRepository {
	return &SwipeRepository{db: db}
}

func (r *SwipeRepository) CreateSwipe(userID, petID int, isLike bool) error {
	query := `
	INSERT INTO swipes (user_id, pet_id, is_like)
	VALUES (?, ?, ?)
	`

	_, err := r.db.Exec(query, userID, petID, isLike)
	return err
}

func (r *SwipeRepository) CreateOwnerSwipe(ownerID, userID, petID int, isLike bool) error {
	query := `
	INSERT INTO owner_swipes (owner_id, user_id, pet_id, is_like)
	VALUES (?, ?, ?, ?)
	`

	_, err := r.db.Exec(query, ownerID, userID, petID, isLike)
	return err
}

func (r *SwipeRepository) HasOwnerLike(userID, petID int) (bool, error) {
	query := `
	SELECT 1 FROM owner_swipes
	WHERE user_id = ? AND pet_id = ? AND is_like = 1
	LIMIT 1
	`

	var exists int
	err := r.db.QueryRow(query, userID, petID).Scan(&exists)

	if err == sql.ErrNoRows {
		return false, nil
	}
	return err == nil, err
}

func (r *SwipeRepository) HasUserLike(userID, petID int) (bool, error) {
	query := `
	SELECT 1 FROM swipes
	WHERE user_id = ? AND pet_id = ? AND is_like = 1
	LIMIT 1
	`

	var exists int
	err := r.db.QueryRow(query, userID, petID).Scan(&exists)

	if err == sql.ErrNoRows {
		return false, nil
	}
	return err == nil, err
}

func (r *SwipeRepository) CreateMatch(userID, petID int) error {
	query := `
	INSERT INTO matches (user_id, pet_id)
	VALUES (?, ?)
	`

	_, err := r.db.Exec(query, userID, petID)
	return err
}

func (r *SwipeRepository) GetPetMode(petID int) (string, error) {
	query := `SELECT adoption_mode FROM pets WHERE id = ?`

	var mode string
	err := r.db.QueryRow(query, petID).Scan(&mode)
	return mode, err
}

//matches

func (r *SwipeRepository) GetMatches(userID int) ([]map[string]interface{}, error) {
	query := `
	SELECT m.id, p.name, p.type
	FROM matches m
	JOIN pets p ON m.pet_id = p.id
	WHERE m.user_id = ?
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}

	for rows.Next() {
		var id int
		var name, t string

		rows.Scan(&id, &name, &t)

		result = append(result, map[string]interface{}{
			"id":   id,
			"name": name,
			"type": t,
		})
	}

	return result, nil
}
