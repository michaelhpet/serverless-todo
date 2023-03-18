import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic => DONE

const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const attachmentsS3Bucket: string = process.env.ATTACHMENTS_S3_BUCKET
const signedUrlExpiration: string = process.env.SIGNED_URL_EXPIRATION

export function getAttachmentUrl(attachmentId: string): string {
  const url: string = `https://${attachmentsS3Bucket}.s3.amazonaws.com/${attachmentId}`
  return url
}

export function getSignedUrl(attachmentId: string): string {
  const signedUrl: string = s3.getSignedUrl('putObject', {
    Bucket: attachmentsS3Bucket,
    Key: attachmentId,
    Expires: signedUrlExpiration
  })
  return signedUrl
}
