package service

import "github.com/tkachevamaria/tula-hack/backend/internal/model"

type PetRepository interface {
	CreatePet(p model.Pet) (int, error)
	GetPetByID(id int) (model.Pet, error)
	GetPetsByOwner(ownerID int) ([]model.Pet, error)
	GetFeed(userID int, limit, offset int) ([]model.Pet, error)
}

type PetService struct {
	repo PetRepository
}

func NewPetService(r PetRepository) *PetService {
	return &PetService{repo: r}
}

func (s *PetService) CreatePet(p model.Pet) (int, error) {
	if p.AdoptionMode == "" {
		p.AdoptionMode = "open"
	}
	return s.repo.CreatePet(p)
}

func (s *PetService) GetPet(id int) (model.Pet, error) {
	return s.repo.GetPetByID(id)
}

func (s *PetService) GetMyPets(userID int) ([]model.Pet, error) {
	return s.repo.GetPetsByOwner(userID)
}

func (s *PetService) GetPetsByOwnerID(ownerID int) ([]model.Pet, error) {
	return s.repo.GetPetsByOwner(ownerID)
}

func (s *PetService) GetFeed(userID int, limit, offset int) ([]model.Pet, error) {
	return s.repo.GetFeed(userID, limit, offset)
}
