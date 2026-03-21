from kafka import KafkaProducer
from app.config import settings

_producer = None

def get_producer():
    global _producer
    if _producer is None:
        try:
            _producer = KafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: str(v).encode('utf-8')
            )
        except Exception as e:
            print(f"Warning: Kafka not available — {e}")
            return None
    return _producer

def publish_assessment_completed(execution_id: int, session_id: str):
    producer = get_producer()
    if producer:
        producer.send("assessment.completed", f"{execution_id}:{session_id}")

def publish_score_generated(execution_id: int, overall_score: float, classification: str):
    producer = get_producer()
    if producer:
        producer.send("score.generated", f"{execution_id}:{overall_score}:{classification}")

def publish_classification_assigned(execution_id: int, classification: str):
    producer = get_producer()
    if producer:
        producer.send("classification.assigned", f"{execution_id}:{classification}")