const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const bucketName = 'xiangsi215924-dev';
    const folderPath = 'public/spot_status/2023/12/10/1a/'; 

    try {
        // List objects in the specified S3 bucket and folder
        const params = {
            Bucket: bucketName,
            Prefix: folderPath
        };
        const listData = await s3.listObjectsV2(params).promise();

        // Sort by LastModified in descending order
        const sortedFiles = listData.Contents.sort((a, b) => b.LastModified - a.LastModified);

        // Check each file starting from the newest
        for (const file of sortedFiles) {
            const fileData = await s3.getObject({ Bucket: bucketName, Key: file.Key }).promise();
            const content = JSON.parse(fileData.Body.toString('utf-8'));

            // Check if the 'data' field is "empty"
            if (content.data === "empty") {
                return {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*",  
                        "Access-Control-Allow-Credentials": true
                    },
                    body: JSON.stringify({ id: content.id, status: 'empty' })
                };
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "No empty spots found" })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to list or read objects' })
        };
    }
};

