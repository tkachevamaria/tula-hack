package repository

import (
	"database/sql"
)

type MessageRepository struct {
	db *sql.DB
}

func NewMessageRepository(db *sql.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) GetMessages(matchID int) ([]map[string]interface{}, error) {

	query := `
	SELECT id, sender_id, receiver_id, text, created_at
	FROM messages
	WHERE match_id = ?
	ORDER BY created_at ASC
	`

	rows, err := r.db.Query(query, matchID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []map[string]interface{}

	for rows.Next() {
		var id, senderID, receiverID int
		var text, createdAt string

		err := rows.Scan(&id, &senderID, &receiverID, &text, &createdAt)
		if err != nil {
			return nil, err
		}

		messages = append(messages, map[string]interface{}{
			"id":          id,
			"sender_id":   senderID,
			"receiver_id": receiverID,
			"text":        text,
			"created_at":  createdAt,
		})
	}

	return messages, nil
}

func (r *MessageRepository) SendMessage(matchID, senderID, receiverID int, text string) error {

	query := `
	INSERT INTO messages (match_id, sender_id, receiver_id, text)
	VALUES (?, ?, ?, ?)
	`

	_, err := r.db.Exec(query, matchID, senderID, receiverID, text)
	return err
}

func (r *MessageRepository) CheckAccess(userID, matchID int) (bool, error) {

	query := `
	SELECT m.user_id, p.owner_id
	FROM matches m
	JOIN pets p ON m.pet_id = p.id
	WHERE m.id = ?
	`

	var matchedUserID, ownerID int

	err := r.db.QueryRow(query, matchID).Scan(&matchedUserID, &ownerID)
	if err != nil {
		return false, err
	}

	if userID == matchedUserID || userID == ownerID {
		return true, nil
	}

	return false, nil
}
