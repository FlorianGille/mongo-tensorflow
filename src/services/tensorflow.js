import Axios from 'axios';

export const getTensorflows = async (filterDate) => await Axios.get(`http://localhost:3000/api/tensorflow${filterDate ? `?filter=${filterDate}` : ``}`)

export const updateTensorflows = async (tensorflowId) => await Axios.put(`http://localhost:3000/api/tensorflow/${tensorflowId}/edit`, {})

export const deleteTensorflows = async (tensorflowId) => await Axios.delete(`http://localhost:3000/api/tensorflow/${tensorflowId}/delete`, {})

export const createTensorflows = async (tensorflowToCreate) => await Axios.post(`http://localhost:3000/api/tensorflow/create`, tensorflowToCreate)