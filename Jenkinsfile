pipeline {
    agent any

    environment {
        IMAGE = 'sapien99/release-alerter'
        TAG = 'latest'
    }

    stages {
        stage('Build') {
            agent any
            steps {
                checkout scm
                sh 'docker build -t $IMAGE:$TAG .'
            }
        }
        stage('Sign') {
            agent any
            steps {
                sh 'docker trust sign $IMAGE:$TAG'
            }
        }        
    }
    post { 
        always { 
            cleanWs()
        }
    }
}
