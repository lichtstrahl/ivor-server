DELIMITER |
create trigger deleteAnswer after delete on answer for each row
begin
DELETE FROM Communication WHERE answerID = OLD.id;
end|

DELIMITER |
CREATE TRIGGER  deleteKeyWord AFTER DELETE ON KeyWord FOR EACH ROW Begin DELETE FROM CommunicationKey WHERE keyID = OLD.id; END;
|

DELIMITER |
CREATE TRIGGER  deleteQuestion AFTER DELETE ON Question FOR EACH ROW 
Begin 
DELETE FROM Communication WHERE questionID = OLD.id; 
END;
|

            
DELIMITER |
CREATE TRIGGER deleteCommunicationKey AFTER DELETE ON CommunicationKey FOR EACH ROW 
                Begin
                DELETE FROM Answer
                WHERE id  NOT IN (
                    SELECT answerID
                    FROM Communication
                ) AND id NOT IN (
                    SELECT answerID
                    FROM CommunicationKey
                );
                END
|

DELIMITER |
SHOW triggers
|