from kafka import KafkaProducer
from app.config import settings

producer = KafkaProducer(
    bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
    value_serializer=lambda v: str(v).encode('utf-8')
)

def publish_assessment_completed(execution_id: int, session_id: str):
    producer.send("assessment.completed", f"{execution_id}:{session_id}")

def publish_score_generated(execution_id: int, overall_score: float, classification: str):
    producer.send("score.generated", f"{execution_id}:{overall_score}:{classification}")

def publish_classification_assigned(execution_id: int, classification: str):
    producer.send("classification.assigned", f"{execution_id}:{classification}")