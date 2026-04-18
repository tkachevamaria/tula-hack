package repository

import (
	"database/sql"

	"github.com/tkachevamaria/tula-hack/backend/internal/model"
)

type PetRepository struct {
	db *sql.DB
}

func NewPetRepository(db *sql.DB) *PetRepository {
	return &PetRepository{db: db}
}

func (r *PetRepository) CreatePet(p model.Pet) (int, error) {
	query := `
		INSERT INTO pets (owner_id, name, type, breed, age, description, adoption_mode)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	res, err := r.db.Exec(
		query,
		p.OwnerID,
		p.Name,
		p.Type,
		p.Breed,
		p.Age,
		p.Description,
		p.AdoptionMode,
	)
	if err != nil {
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id), nil
}

func (r *PetRepository) GetPetByID(id int) (model.Pet, error) {
	query := `
		SELECT id, owner_id, name, type, breed, age, description, adoption_mode, status
		FROM pets
		WHERE id = ?
	`

	var p model.Pet

	err := r.db.QueryRow(query, id).Scan(
		&p.ID,
		&p.OwnerID,
		&p.Name,
		&p.Type,
		&p.Breed,
		&p.Age,
		&p.Description,
		&p.AdoptionMode,
		&p.Status,
	)

	if err != nil {
		return model.Pet{}, err
	}

	return p, nil
}

func (r *PetRepository) GetPetsByOwner(ownerID int) ([]model.Pet, error) {
	query := `
		SELECT id, owner_id, name, type, breed, age, description, adoption_mode, status
		FROM pets
		WHERE owner_id = ?
	`

	rows, err := r.db.Query(query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pets []model.Pet

	for rows.Next() {
		var p model.Pet
		err := rows.Scan(
			&p.ID,
			&p.OwnerID,
			&p.Name,
			&p.Type,
			&p.Breed,
			&p.Age,
			&p.Description,
			&p.AdoptionMode,
			&p.Status,
		)
		if err != nil {
			return nil, err
		}
		pets = append(pets, p)
	}

	return pets, nil
}

// тут есть проверка на своих питомцев и уже свайпнутых!!!
func (r *PetRepository) GetFeed(userID int, limit, offset int) ([]model.Pet, error) {

	query := `
	SELECT 
		p.id, p.owner_id, p.name, p.type, p.breed, p.age, p.description, p.adoption_mode, p.status
	FROM pets p
	LEFT JOIN user_preferences up ON up.user_id = ?
	WHERE p.owner_id != ?
	AND p.id NOT IN (
		SELECT pet_id FROM swipes WHERE user_id = ?
	)
	ORDER BY
		CASE WHEN up.preferred_type IS NOT NULL AND p.type = up.preferred_type THEN 3 ELSE 0 END +
		CASE WHEN up.preferred_breed IS NOT NULL AND p.breed = up.preferred_breed THEN 2 ELSE 0 END +
		CASE 
			WHEN up.min_age IS NOT NULL AND up.max_age IS NOT NULL 
			AND p.age BETWEEN up.min_age AND up.max_age THEN 2 
			ELSE 0 
		END DESC
	LIMIT ? OFFSET ?
	`

	rows, err := r.db.Query(query, userID, userID, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pets []model.Pet

	for rows.Next() {
		var p model.Pet

		err := rows.Scan(
			&p.ID,
			&p.OwnerID,
			&p.Name,
			&p.Type,
			&p.Breed,
			&p.Age,
			&p.Description,
			&p.AdoptionMode,
			&p.Status,
		)
		if err != nil {
			return nil, err
		}

		pets = append(pets, p)
	}

	return pets, nil
}
