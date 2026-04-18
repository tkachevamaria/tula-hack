package service

type MessageRepository interface {
	GetMessages(matchID int) ([]map[string]interface{}, error)
	SendMessage(matchID, senderID, receiverID int, text string) error
}

type MessageService struct {
	repo MessageRepository
}

func NewMessageService(r MessageRepository) *MessageService {
	return &MessageService{repo: r}
}

func (s *MessageService) GetMessages(matchID int) ([]map[string]interface{}, error) {
	return s.repo.GetMessages(matchID)
}

func (s *MessageService) SendMessage(matchID, senderID, receiverID int, text string) error {

	if text == "" {
		return nil // можно сделать ошибку, но для MVP ок
	}

	return s.repo.SendMessage(matchID, senderID, receiverID, text)
}
