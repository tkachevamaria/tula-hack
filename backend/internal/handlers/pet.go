package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/model"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type PetHandler struct {
	service      *service.PetService
	photoService *service.PhotoService
}

func NewPetHandler(s *service.PetService, ps *service.PhotoService) *PetHandler {
	return &PetHandler{
		service:      s,
		photoService: ps,
	}
}

type CreatePetInput struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Breed        string `json:"breed"`
	Age          int    `json:"age"`
	Description  string `json:"description"`
	AdoptionMode string `json:"adoption_mode"`
}

func (h *PetHandler) CreatePet(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input CreatePetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	pet := model.Pet{
		OwnerID:      userID,
		Name:         input.Name,
		Type:         input.Type,
		Breed:        input.Breed,
		Age:          input.Age,
		Description:  input.Description,
		AdoptionMode: input.AdoptionMode,
	}

	id, err := h.service.CreatePet(pet)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to create pet"})
		return
	}

	c.JSON(200, gin.H{"id": id})
}

func (h *PetHandler) GetPet(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	pet, err := h.service.GetPet(id)
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	photos, _ := h.photoService.GetPetPhotos(id)

	c.JSON(200, gin.H{
		"pet":    pet,
		"photos": photos,
	})
}

func (h *PetHandler) GetMyPets(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	pets, err := h.service.GetMyPets(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, pets)
}

// GET /users/:id/pets — получить питомцев конкретного пользователя
func (h *PetHandler) GetUserPets(c *gin.Context) {
	// Берём ID из URL, а не из заголовка
	ownerIDStr := c.Param("id")
	ownerID, err := strconv.Atoi(ownerIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}

	pets, err := h.service.GetPetsByOwnerID(ownerID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to get pets"})
		return
	}

	c.JSON(200, pets)
}

func (h *PetHandler) GetFeed(c *gin.Context) {

	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	pets, err := h.service.GetFeed(userID, 10, 0)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	var result []map[string]interface{}

	for _, p := range pets {
		photos, _ := h.photoService.GetPetPhotos(p.ID)

		result = append(result, map[string]interface{}{
			"pet":    p,
			"photos": photos,
		})
	}

	c.JSON(200, result)
}
