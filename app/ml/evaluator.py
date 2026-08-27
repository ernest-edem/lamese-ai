import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    f1_score,
    recall_score,
    precision_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
)

from sklearn.pipeline import Pipeline

from app.core.logger import logger


def evaluate_pipeline(
    pipeline: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> float:
    """
    Evaluate the trained machine learning pipeline.

    Args:
        pipeline: Trained ML pipeline.
        X_test: Unseen test features.
        y_test: Actual test target values.

    Returns:
        float: Accuracy score ranging from 0.0 to 1.0.
    """

    prediction = pipeline.predict(
        X_test,
    )

    accuracy = accuracy_score(
        y_test,
        prediction,
    )

    logger.info(
        "Accuracy: %.2f",
        accuracy,
    )

    f1 = f1_score(
        y_test,
        prediction,
    )

    logger.info(
        "F1 Score: %.2f",
        f1,
    )

    precision = precision_score(
        y_test,
        prediction,
    )

    logger.info(
        "Precision: %.2f",
        precision,
    )

    recall = recall_score(
        y_test,
        prediction,
    )

    logger.info(
        "Recall: %.2f",
        recall,
    )

    matrix = confusion_matrix(
        y_test,
        prediction,
    )

    logger.info(
        "Confusion Matrix:\n%s",
        matrix,
    )

    report = classification_report(
        y_test,
        prediction,
    )

    logger.info(
        "Classification Report:\n%s",
        report,
    )

    probability = pipeline.predict_proba(
        X_test,
    )

    positive_probability = probability[:, 1]

    roc_auc = roc_auc_score(
        y_test,
        positive_probability,
    )

    logger.info(
        "ROC-AUC: %.2f",
        roc_auc,
    )

    return accuracy


def evaluate_thresholds(
    pipeline: Pipeline,
    X_validation: pd.DataFrame,
    y_validation: pd.Series,
) -> None:
    """
    Evaluate classification performance across
    multiple probability thresholds using validation data.

    Args:
        pipeline: Trained ML pipeline.
        X_validation: Validation features.
        y_validation: Validation target values.
    """

    probability = pipeline.predict_proba(
        X_validation,
    )

    positive_probability = probability[:, 1]

    thresholds = [
        0.30,
        0.40,
        0.50,
        0.60,
        0.70,
    ]

    for threshold in thresholds:

        custom_prediction = (
            positive_probability >= threshold
        ).astype(int)

        threshold_accuracy = accuracy_score(
            y_validation,
            custom_prediction,
        )

        threshold_precision = precision_score(
            y_validation,
            custom_prediction,
        )

        threshold_recall = recall_score(
            y_validation,
            custom_prediction,
        )

        threshold_f1 = f1_score(
            y_validation,
            custom_prediction,
        )

        threshold_matrix = confusion_matrix(
            y_validation,
            custom_prediction,
        )

        tn, fp, fn, tp = threshold_matrix.ravel()

        logger.info(
            (
                "Validation Threshold %.2f | "
                "Accuracy: %.2f | "
                "Precision: %.2f | "
                "Recall: %.2f | "
                "F1: %.2f | "
                "FP: %d | "
                "FN: %d"
            ),
            threshold,
            threshold_accuracy,
            threshold_precision,
            threshold_recall,
            threshold_f1,
            fp,
            fn,
        )