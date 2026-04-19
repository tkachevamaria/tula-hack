package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type MessageHandler struct {
	service *service.MessageService
}

func NewMessageHandler(s *service.MessageService) *MessageHandler {
	return &MessageHandler{service: s}
}

func (h *MessageHandler) GetMessages(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	matchID, _ := strconv.Atoi(c.Param("id"))

	messages, err := h.service.GetMessages(userID, matchID)
	if err != nil {
		c.JSON(403, gin.H{"error": "no access"})
		return
	}

	c.JSON(200, messages)
}

type SendMessageInput struct {
	MatchID    int    `json:"match_id"`
	ReceiverID int    `json:"receiver_id"`
	Text       string `json:"text"`
}

func (h *MessageHandler) SendMessage(c *gin.Context) {
	senderID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input SendMessageInput
	c.ShouldBindJSON(&input)

	err := h.service.SendMessage(
		input.MatchID,
		senderID,
		input.ReceiverID,
		input.Text,
	)

	if err != nil {
		c.JSON(403, gin.H{"error": "no access"})
		return
	}

	c.JSON(200, gin.H{"message": "sent"})
}
