package repository

import "database/sql"

type PhotoRepository struct {
	db *sql.DB
}

func NewPhotoRepository(db *sql.DB) *PhotoRepository {
	return &PhotoRepository{db: db}
}

func (r *PhotoRepository) AddPetPhoto(petID int, url string) error {
	query := `
	INSERT INTO pet_photos (pet_id, url)
	VALUES (?, ?)
	`

	_, err := r.db.Exec(query, petID, url)
	return err
}

func (r *PhotoRepository) AddAccountPhoto(accountID int, url string, isMain bool) error {

	query := `
	INSERT INTO account_photos (account_id, url, is_main)
	VALUES (?, ?, ?)
	`

	_, err := r.db.Exec(query, accountID, url, isMain)
	return err
}

func (r *PhotoRepository) GetPetPhotos(petID int) ([]string, error) {
	query := `
	SELECT url FROM pet_photos WHERE pet_id = ?
	`

	rows, err := r.db.Query(query, petID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var photos []string

	for rows.Next() {
		var url string
		rows.Scan(&url)
		photos = append(photos, url)
	}

	return photos, nil
}
