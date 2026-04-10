import * as evaluationService from '../services/evaluation.service.js'
import { ok, fail } from '../utils/aiResponse.js'

// ================================
// 📌 GET EVALUATOR QUEUE
// ================================
export const myQueue = async (req, res) => {
  try {
    ok(res, await evaluationService.getQueue(req.user._id))
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 GET ASSIGNED SUBMISSION
// ================================
export const getAssignedSubmission = async (req, res) => {
  try {
    ok(
      res,
      await evaluationService.getAssignedSubmission(
        req.params.submissionId,
        req.user._id
      )
    )
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 LIST EVALUATIONS (ADMIN)
// ================================
export const list = async (req, res) => {
  try {
    const filters = {}

    if (req.query.submissionId) filters.submissionId = req.query.submissionId
    if (req.query.evaluatorId) filters.evaluatorId = req.query.evaluatorId

    ok(res, await evaluationService.list(filters))
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 GET SINGLE EVALUATION
// ================================
export const get = async (req, res) => {
  try {
    ok(res, await evaluationService.getById(req.params.id))
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 CREATE EVALUATION
// ================================
export const create = async (req, res) => {
  try {
    ok(res, await evaluationService.create(req.body, req.user._id), 201)
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 UPDATE EVALUATION
// ================================
export const update = async (req, res) => {
  try {
    ok(
      res,
      await evaluationService.update(
        req.params.id,
        req.body,
        req.user._id
      )
    )
  } catch (e) {
    fail(res, e)
  }
}
